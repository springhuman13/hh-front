FROM python:3.11

WORKDIR /app
COPY ./static /app

EXPOSE 3000
CMD ["python", "-m", "http.server", "3000", "--bind", "0.0.0.0"]