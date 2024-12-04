# URL Shortener Backend

A robust and scalable backend service for shortening URLs, designed to provide efficient URL redirection and management. Built with modern web technologies for speed, reliability, and ease of use.

## Features

- **Shorten URLs**: Generate short, unique URLs for long web addresses.
- **Redirects**: Fast redirection from short URLs to their original destinations.
- **Analytics**: Track usage statistics for shortened URLs (e.g., click counts, locations).
- **Custom URLs**: Option to create custom aliases for URLs.
- **Scalable**: Designed to handle high traffic and large datasets.

---

## Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/yongjintan/url-shortener-backend.git
cd url-shortener-backend
```

Install the required dependencies:

```bash
npm install
```

## Configuration
Create a `.env` file in the project root to configure the following enviroment variables:
```env
PORT=3000
DATABASE_URL=your_database_connection_string
BASE_URL=http://localhost:3000
```
Adjust the value as per your environment.

### Starting the Server

```bash
npm start
```

### API Endpoints

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| POST   | `/shorten`           | Shortens a given URL.        |
| GET    | `/:shortCode`        | Redirects to the long URL.   |

## Example Payload for `/shorten`: 
```json
{
  "longUrl": "https://example.com/some/very/long/url",
}
```
## Response:
```json
{
  "shortUrl": "http://localhost:3000/abc123"
}
```


