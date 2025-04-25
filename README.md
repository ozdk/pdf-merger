# PDF Merger Application

This project is a secure web application that allows users to upload multiple PDF files, merge them into a single PDF file, and download the resulting file. The application processes all files locally in your browser - nothing is uploaded to any server. It utilizes the `pdf-lib` library for PDF manipulation and offers complete privacy.

## Features

- Upload multiple PDF files via drag-and-drop or file selection dialog
- Reorder files to control the sequence of the merged document
- Preview PDFs before and after merging 
- Merge uploaded PDF files into one document
- Download the merged PDF file
- Complete privacy - all processing happens in your browser
- No file size limits beyond browser constraints
- Mobile-friendly responsive design
- No registration or login required

## Privacy & Security

- **Zero server uploads** - All PDF processing happens directly in your browser
- **No data collection** - We don't use cookies or tracking technologies
- **Network monitoring** - Visual indicators show when network requests occur
- **Strict Content Security Policy** - Prevents unauthorized code execution
- **Open source** - Code is transparent and can be audited

## Project Structure

```
pdf-merger
├── src
│   ├── js
│   │   ├── app.js          # Main JavaScript file for handling user interactions
│   │   ├── pdfMerger.js    # Logic for merging PDF files
│   │   └── fileUtils.js     # Utility functions for file operations
│   ├── css
│   │   └── styles.css      # Styles for the web application
│   └── index.html          # Main HTML file for the application
├── lib
│   └── pdf-lib.min.js      # Minified PDF manipulation library
├── .gitignore               # Files and directories to ignore by Git
├── package.json             # npm configuration file
└── README.md                # Documentation for the project
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd pdf-merger
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Open `src/index.html` in a web browser to run the application.

## Usage

1. Click on the upload button to select multiple PDF files.
2. Once the files are uploaded, click on the "Merge PDFs" button.
3. After the merging process is complete, a download link will appear for the merged PDF file.

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.