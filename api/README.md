# FastAPI Application

This is a FastAPI application that serves as a proxy to the OpenAI API. It accepts a POST request at the `/generate-reply` endpoint, sends a request to the OpenAI API, and returns the generated reply.

## Setup

1. Install Python 3.6 or higher if you haven't done so already.

2. It's recommended to create a virtual environment for your application. You can do this by running the following commands in your terminal:

```bash
cd api
python3 -m venv venv
```
This will create a new virtual environment in a folder named venv in the my_fastapi_app directory.
3. Activate the virtual environment:
```bash
# On macOS and Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate
```
4. Install the required packages:
```bash
pip install requirements.txt
```

## Running the Application
1. Make sure your virtual environment is activated.

2. Navigate to the directory where your FastAPI application (main.py) is located.

3. Run the following command to start your FastAPI application:

```bash
uvicorn main:app --reload
```

By default, Uvicorn will start the server on localhost at port 8000. You can specify a different host or port by using the --host and --port options.

You can then access your FastAPI application by navigating to http://localhost:8000 in your web browser.

If you want to test in browser go to http://localhost:8000/docs
