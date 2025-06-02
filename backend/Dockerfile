FROM python:3.12-alpine as base

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app
COPY src /app

RUN pip install --no-cache -r requirements.txt

# Set the environment variable to production
ENV DEBUG false
ENV DJANGO_ENV production

# Expose the port that Django runs on
EXPOSE 8000

RUN --mount=type=secret,id=backend_s,target=/run/secrets/backend_s \
    export $(grep -v '^#' /run/secrets/backend_s | xargs) && \
    python manage.py collectstatic && \
    python manage.py makemigrations && \
    python manage.py migrate

# Copy files from the STATIC_ROOT to a STATICFILES_DIRS
RUN cp -r /app/statictemp /app/staticfiles

# Command to run the Django app
CMD [ "gunicorn" ,"--bind", "0.0.0.0:8000", "backend.wsgi:application" ]
