# Georgia Company Search & Workspace Detector

A modern, serverless web application designed to search through a database of Georgian companies and automatically detect if their domains are configured with Google Workspace.

## Features

- **Google Workspace Detection**: Automatically queries the DNS over HTTPS API (Google DNS) to check a company's MX records in real-time.
- **Serverless Architecture**: 100% frontend implementation. No Node.js, Python, or backend server required.
- **Premium UI**: Modern dark-mode aesthetics featuring glassmorphism, responsive grid layouts, and micro-animations.
- **Opportunity Filtering**: Quickly filter companies by their Workspace status (e.g., "Uses Workspace" or "Workspace Opportunity").
- **Dynamic Search**: Instantly search across company names, domains, and industries.

## How to Run

Because this is a completely static frontend application, running it is incredibly simple:

1. Open your File Explorer.
2. Navigate to the project folder.
3. Double-click the `index.html` file to open it in your default web browser (Chrome, Edge, Safari, Firefox, etc.).

*Alternatively, if you prefer to use a local development server, you can run tools like VS Code Live Server or `python -m http.server`.*

## Modifying the Data

The application currently uses a mock dataset for demonstration purposes. To add your own company data:

1. Open `mockData.js` in any text editor.
2. Modify the `MOCK_COMPANIES` array. Ensure your new entries follow the same object structure:

```javascript
{ 
  id: 1, 
  name: "Company Name", 
  industry: "Industry", 
  domain: "example.ge", 
  location: "Tbilisi" 
}
```

## Technologies Used

- **HTML5 & CSS3**: For structure, styling, and animations.
- **Vanilla JavaScript**: For logic, DOM manipulation, and API fetching.
- **Google DNS over HTTPS**: For bypassing browser CORS restrictions to perform live MX record lookups (`https://dns.google/resolve`).
- **Font Awesome**: For UI icons.
- **Google Fonts**: Outfit font family for typography.
