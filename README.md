# Monitoring

An uptime monitoring RESTful API server that allows authenticated users to monitor URLs, and get detailed uptime reports about their availability, average response time, and total uptime/downtime.

- Stateless Authenication.
- Each URL check may have the following options:
  - `name`: The name of the check.
  - `url`: The URL to be monitored.
  - `protocol`: The resource protocol name `HTTP`, `HTTPS`, or `TCP`.
  - `path`: A specific path to be monitored _(optional)_.
  - `port`: The server port number _(optional)_.
  - `webhook`: A webhook URL to receive a notification on _(optional)_.
  - `timeout` _(defaults to 5 seconds)_: The timeout of the polling request _(optional)_.
  - `interval` _(defaults to 10 minutes)_: The time interval for polling requests _(optional)_.
  - `threshold` _(defaults to 1 failure)_: The threshold of failed requests that will create an alert _(optional)_.
  - `authentication`: An HTTP authentication header, with the Basic scheme, to be sent with the polling request _(optional)_.
    - `authentication.username`
    - `authentication.password`
  - `httpHeaders`: A list of key/value pairs custom HTTP headers to be sent with the polling request (optional).
  - `assert`: The response assertion to be used on the polling response (optional).
    - `assert.statusCode`: An HTTP status code to be asserted.
  - `tags`: A list of the check tags (optional).
  - `ignoreSSL`: A flag to ignore broken/expired SSL certificates in case of using the HTTPS protocol.
- Each report may have the following information:
  - `status`: The current status of the URL.
  - `availability`: A percentage of the URL availability.
  - `outages`: The total number of URL downtimes.
  - `downtime`: The total time, in seconds, of the URL downtime.
  - `uptime`: The total time, in seconds, of the URL uptime.
  - `responseTime`: The average response time for the URL.
  - `history`: Timestamped logs of the polling requests.

Other features:

- Tests
- API Documentation (using OpenAPI)
- Docker and Docker Compose
- CI for building and pushing image to DockerHub
- CI for running tests

Technologies used:

- NodeJS
- TypeScript
- ExpressJS
- MongoDB
- Redis
- Docker
- Docker Compose
- GitHub Actions
