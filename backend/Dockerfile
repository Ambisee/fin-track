# Use an official Python runtime as a parent image
FROM surnet/alpine-wkhtmltopdf:3.20.0-0.12.6-small as wkhtmltopdf
FROM python:3.11-alpine

RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    libstdc++ \
    libx11 \
    libxrender \
    libxext \
    libssl3 \
    ca-certificates \
    fontconfig \
    freetype \
    ttf-dejavu \
    ttf-droid \
    ttf-freefont \
    ttf-liberation

COPY --from=wkhtmltopdf /bin/wkhtmltopdf /bin/wkhtmltopdf
COPY --from=wkhtmltopdf /bin/libwkhtmltox* /bin/

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY . /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Set the environment variable to production
ENV DJANGO_ENV production

# Expose the port that Django runs on
EXPOSE 8000

# Command to run the Django app
CMD [ "gunicorn" ,"--bind", "0.0.0.0:8000", "backend.wsgi:application" ]
