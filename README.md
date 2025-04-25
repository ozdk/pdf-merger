# PDF Merger Application

This project is a simple web application that allows users to upload multiple PDF files, merge them into a single PDF file, and download the resulting file. It utilizes the `pdf-lib` library for PDF manipulation.

## Features

- Upload multiple PDF files
- Merge uploaded PDF files into one
- Download the merged PDF file

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