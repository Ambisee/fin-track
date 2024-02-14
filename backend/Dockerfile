FROM python:3.11-alpine

WORKDIR /
COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "manage.py", "runserver"]
