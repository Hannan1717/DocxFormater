import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');

  const generateMarkdown = (questions) => {
    let AE = ['A', 'B', 'C', 'D', 'E'];
    let markdownString = '';

    questions.forEach((question, n) => {
      markdownString += `${n + 1}. ${question[0]}\n`;

      question[1].forEach((option, i) => {
        markdownString += `\t${AE[i]}. ${option}\n`;
      });

      markdownString += `\tJawaban: ${question[2]}`;
      markdownString += `\n\tPembahasan: ${question[3]}\n`;
    });

    return markdownString;
  };

  const handleJsonInputChange = (event) => {
    const inputText = event.target.value;
    try {
      const questions = JSON.parse(inputText);
      const markdown = generateMarkdown(questions);
      setMarkdownOutput(markdown);
    } catch (error) {
      setMarkdownOutput('Invalid JSON format');
    }
  };

  const convertToDocx = () => {
    const markdownContent = markdownOutput.split("\n");
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "question",
            name: "Question",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Times New Roman",
              size: 24,
            },
            paragraph: {
              spacing: { line: 1.5 * 240 },
            },
          },
          {
            id: "option",
            name: "Option",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Times New Roman",
              size: 24,
            },
            paragraph: {
              indent: { left: 720 },
              spacing: { line: 1.5 * 240 },
            },
          },
          {
            id: "answerExplanation",
            name: "AnswerExplanation",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Times New Roman",
              size: 24,
            },
            paragraph: {
              indent: { left: 720, hanging: 0 },
              spacing: { line: 1.5 * 240 },
            },
          },
        ],
      },
      sections: [
        {
          children: markdownContent.map((line) => {
            const questionRegex = /^[0-9]+\./;
            const optionRegex = /^[A-E]\./;

            if (questionRegex.test(line)) {
              return new Paragraph({
                text: line,
                style: "question",
              });
            } else if (optionRegex.test(line)) {
              return new Paragraph({
                text: line,
                style: "option",
              });
            } else if (line.includes("Jawaban:") || line.includes("Pembahasan:")) {
              const isPembahasan = line.includes("Pembahasan:");
              const parts = isPembahasan ? line.split("Pembahasan:") : line.split("Jawaban:");
              return new Paragraph({
                children: [
                  new TextRun({
                    text: isPembahasan ? "Pembahasan:" : "Jawaban:",
                    bold: true,
                  }),
                  new TextRun({
                    text: parts[1] ? ` ${parts[1].trim()}` : "",
                  }),
                ],
                style: "answerExplanation",
              });
            } else {
              return new Paragraph({
                text: line,
                style: "question",
              });
            }
          }),
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'questions.docx');
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">JSON to Markdown to Word Converter</h2>

        <div className="space-y-2">
          <label htmlFor="jsonInput" className="block text-gray-700 font-medium">JSON:</label>
          <textarea
            id="jsonInput"
            rows="10"
            value={jsonInput}
            onChange={handleJsonInputChange}
            placeholder="Masukkan JSON di sini"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="markdownOutput" className="block text-gray-700 font-medium">Markdown Result:</label>
          <textarea
            id="markdownOutput"
            rows="10"
            value={markdownOutput}
            readOnly
            placeholder="Hasil markdown akan muncul di sini..."
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
          />
        </div>

        <button
          onClick={convertToDocx}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Convert to Word (DOCX)
        </button>
      </div>
    </div>
  );
}

export default App;
