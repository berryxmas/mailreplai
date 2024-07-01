# Mailreplai api

api built for mailreplai.

## Running the Application Locally

To run the application locally, use the following command:

```bash
uvicorn --app-dir=. api.main:app --reload
```
This command starts the Uvicorn server with the application.

## Running Tests
To run the tests locally, use the following command:

```bash
python -m pytest tests/test_api.py
```
This command runs all the tests located in the tests/test_api.py file.

## Deployment
The application is deployed on Azure using github actions. You can access the API at the following URI:
```
https://mailreplai-api-container.blackflower-ef371743.centralus.azurecontainerapps.io
```
