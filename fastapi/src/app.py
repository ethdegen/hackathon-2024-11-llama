import os
import re
import shutil
import tempfile
import zipfile
from typing import Annotated, Dict, List

import requests
from dotenv import load_dotenv
from llama_index.llms.together import TogetherLLM
from pydantic import BaseModel

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

llm = TogetherLLM(
    model="meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
    api_key=os.environ["TOGETHER_API_KEY"],
)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/v1/healthz")
def healthz():
    return {"up": True}


@app.get("/")
def index():
    return {"Hello": "Something"}


finetunes = dict()


class FileNode:
    def __init__(self, name: str, is_file: bool = False, content: str = None):
        self.name = name
        self.is_file = is_file
        self.content = content
        self.children: Dict[str, "FileNode"] = {}

    def to_dict(self):
        if self.is_file:
            return {"name": self.name, "type": "file"}
        return {
            "name": self.name,
            "type": "directory",
            "children": [child.to_dict() for child in self.children.values()],
        }


def parse_github_url(repoUrl: str) -> tuple[str, str, str]:
    """Parse GitHub URL to extract owner, repo, and branch."""
    pattern = r"https?://github\.com/([^/]+)/([^/]+)(?:/tree/([^/]+))?"
    match = re.match(pattern, repoUrl)

    if not match:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub URL. Format: https://github.com/owner/repo",
        )

    owner = match.group(1)
    repo = match.group(2)
    repo = repo.replace(".git", "")
    branch = match.group(3) or ("main" if repo == "llama3" else "master")

    return owner, repo, branch


def build_tree(base_path: str) -> tuple[FileNode, List[tuple[str, str]], str]:
    """
    Build a tree structure of markdown files and collect their paths.
    Returns: (root_node, list of (title, content) tuples, first article content)
    """
    root = FileNode("root")
    md_files = []
    first_article = None

    for dirpath, _, filenames in os.walk(base_path):
        # Skip hidden directories and their contents
        if any(part.startswith(".") for part in dirpath.split(os.sep)):
            continue

        for filename in sorted(filenames):
            if filename.endswith(".md"):
                full_path = os.path.join(dirpath, filename)
                rel_path = os.path.relpath(full_path, base_path)

                # Read the content of the markdown file
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Store the first article's content
                if first_article is None:
                    first_article = {
                        "title": filename,  # Remove .md extension
                        "content": content,
                    }

                # Build the tree structure
                current = root
                parts = rel_path.split(os.sep)

                # Handle directories in the path
                for part in parts[:-1]:
                    if part not in current.children:
                        current.children[part] = FileNode(part)
                    current = current.children[part]

                # Add the file
                current.children[filename] = FileNode(filename, is_file=True)
                md_files.append((filename, content))

    return root, md_files, first_article


@app.get("/parse")
async def parse_repo(repoUrl: str):
    """
    Download a GitHub repository and create a tree structure of markdown files.
    """
    try:
        owner, repo, branch = parse_github_url(repoUrl)

        # Create a temporary directory
        temp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(temp_dir, f"{repo}.zip")

        # Download the repository
        download_url = (
            f"https://github.com/{owner}/{repo}/archive/refs/heads/{branch}.zip"
        )
        response = requests.get(download_url, stream=True)

        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Repository not found")

        # Save the zip file
        with open(zip_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # Extract the zip file
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)

        # Remove the zip file
        os.remove(zip_path)

        # Get the extracted directory path
        repo_dir = os.path.join(temp_dir, f"{repo}-{branch}")

        # Build the tree and get markdown files
        root_node, md_files, first_article = build_tree(repo_dir)

        return {
            "status": "success",
            "message": "Repository parsed successfully",
            "details": {
                "identifier_dir": repo_dir,
                "owner": owner,
                "repo": repo,
                "branch": branch,
                "total_md_files": len(md_files),
            },
            "content": first_article or {"title": None, "content": None},
            "files": root_node.to_dict(),
        }

    except Exception as e:
        if "temp_dir" in locals() and temp_dir:
            shutil.rmtree(temp_dir)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/translate")
async def translate(
    request: Request,
    authorization: Annotated[str, Header()] = None,
    language_from: str = "English",
    language_to: str = "Hindi",
):
    source_binary = await request.body()

    finetune = list()
    if authorization:
        bearer_token = authorization[7:]
        if bearer_token:
            finetune = (
                finetunes.get(bearer_token, dict())
                .get(language_from, dict())
                .get(language_to, list())
            )

    prompt = f"""
You are an expert language transalator, tasked to translate from source text in {language_from} language to {language_to} language.
The source text provided is a markdown file. You are required to translate the content of the markdown file to the target language.
THIS IS A HIGH PRECISION TASK, PLEASE MAKE SURE TO FOLLOW THE INSTRUCTIONS CAREFULLY.

Do:
- Translate the text content of the markdown file from {language_from} language to {language_to} language.
- Keep the markdown formatting as is.
- Keep the code blocks as is and do not translate them.
- Keep the URLs, images, or other media as is and do not translate them.
- Keep the technical terms or jargon as is and do not translate them.
- Keep the Nouns that may not have a direct translation in the target language as is and do not translate them.
- KEEP any mardown specific syntax, like - ```md, ```json, ```html, code etc, as is and do not translate them.
- IMPORTANT: ANY THING STARTING WITH BACKTICKS (`) IS A CODE BLOCK, KEEP IT AS IS.


Don't:
- Don't Make up anything that is not in the source text.
- Don't Translate the code blocks.
- Don't Translate the URLs, images, or other media.
- Don't Translate the technical terms or jargon.
- Don't Translate the Nouns that may not have a direct translation in the target language.
- Don't Translate anything that is not in the source text.
- DON'T EVER Translate the markdown specific syntax.
- ANY THING STARTING WITH BACKTICKS (`) IS A CODE BLOCK AND SHOULD NOT BE TRANSLATED. KEEP IT AS IS.


Example:

EXAMPLE 1:
The source text in English language is:

# Hello World
```javascript
console.log('Hello, World!');
```
The translated to Hindi language would be:
# नमस्ते दुनिया
```javascript
console.log('Hello, World!');
```

Example 2:
The source text in English language is:
# About Us
We are a team of developers working on exciting projects.
```md
Contact us at [123-456-7890](tel:123-456-7890)
```
The translated to Hindi language would be:
# हमारे बारे में
हम एक टीम हैं जो रोमांचक परियोजनाओं पर काम कर रही है।
```md
हमसे संपर्क करें [123-456-7890](tel:123-456-7890)
```

DON'T MAKE UP ANYTHING THAT IS NOT IN THE SOURCE TEXT. ONLY TRANSLATE THE TEXT CONTENT OF THE MARKDOWN FILE.

Give your output as markdown text containing the translated text.
MAKE SURE YOUR OUTPUT IS VALID MARKDOWN AND HAS EXACT FORMATING AS THE source text.

Here is the source text in {language_from} language:
{source_binary.decode("utf-8")}
"""

    if finetune:
        prompt += f"""\
            Here are {len(finetune)} example(s）of to translation from {language_from} language to {language_to} language.
        """

        for i, example in enumerate(finetune):
            prompt += f"""\
                Example {i+1}:

                {example.source_text}

                translates to

                {example.output_text}

            """

    print(
        {
            "prompt": prompt,
        }
    )

    resp = await llm.acomplete(prompt)

    output = resp.text
    print(
        {
            "prompt": prompt,
            "output": output,
        }
    )

    try:
        # json_obj = json.loads(json_text)

        print(
            {
                "prompt": prompt,
                "output": output,
                "result": output,
            }
        )
        return {"result": output}

    except:  # noqa: E722
        return {"result": output}


class Finetune(BaseModel):
    source_text: str
    output_text: str


## Submit a single example ("shot") of a translation to "fine-tune" the translation process.
## The user's name must be included via an authorization header as a bearer token; e.g.
## Authorization: Bearer myUsername
@app.post("/finetune")
async def finetune(
    example: Finetune,
    authorization: Annotated[str, Header()],
    language_from: str = "English",
    language_to: str = "Hindi",
):
    bearer_token = authorization[7:]
    if bearer_token:
        finetune_user = finetunes.get(bearer_token, dict())
        finetune_user_from = finetune_user.get(language_from, dict())
        finetune_user_to = finetune_user_from.get(language_to, list())
        finetune_user_to.append(example)
        finetune_user_from[language_to] = finetune_user_to
        finetune_user[language_from] = finetune_user_from
        finetunes[bearer_token] = finetune_user

        print(finetunes)
        return finetune_user

    raise HTTPException(status_code=400, detail="missing authorization bearer token")
