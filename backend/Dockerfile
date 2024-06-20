FROM python:3.11-slim-bookworm as base

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY . /app/

RUN pip install --no-cache -r requirements.txt

# Set the environment variable to production
ENV DJANGO_ENV production
ENV DOCUMENT_ENGINE reportlab
ENV DEBUG False

# Set API-related variables
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG SUPABASE_SECRET_KEY
ARG RESEND_KEY
ARG ALLOWED_HOSTS

ENV SUPABASE_URL ${SUPABASE_URL}
ENV SUPABASE_KEY ${SUPABASE_KEY}
ENV SUPABASE_SECRET_KEY ${SUPABASE_SECRET_KEY}
ENV RESEND_KEY ${RESEND_KEY}
ENV ALLOWED_HOSTS ${ALLOWED_HOSTS}

# Expose the port that Django runs on
EXPOSE 8000

# Command to run the Django app
CMD [ "gunicorn" ,"--bind", "0.0.0.0:8000", "backend.wsgi:application" ]
