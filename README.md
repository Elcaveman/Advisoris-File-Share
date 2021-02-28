# Universias

Universias is a Website for scientific reasearchers made with the Django framework in Python.

## Installation
You need to have [Python 3.8.2](https://www.python.org/)
Use the package manager [pip](https://pip.pypa.io/en/stable/) to install the dependencies in requirements.txt.

```bash
pip install -r requirements.txt
#or
py -m pip install -r requirements.txt
```

## Usage
Before hosting make sure to disable [DEBUG] by setting it to [False] and set the [ALLOWED_HOSTS] varriable in the setting file
```python
DEBUG = False
#Allow CDN's as well
ALLOWED_HOSTS = [
    'localhost',
    #...
    ]

```
To run the server make sure you're in the root directory of the project
```bash
py manage.py runserver
```
Open your Browser and connect to [localhost:8000](http://localhost:8000/)
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
