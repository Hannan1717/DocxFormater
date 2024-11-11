import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
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
              size: 24, // 12pt
            },
            paragraph: {
              spacing: { line: 1.5 * 240 }, // 1.5 line spacing
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
              size: 24, // 12pt
            },
            paragraph: {
              indent: { left: 720 }, // Indentation for options (0.5 inch)
              spacing: { line: 1.5 * 240 }, // 1.5 line spacing
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
              size: 24, // 12pt
            },
            paragraph: {
              indent: { left: 720, hanging: 0 }, // Indentation and hanging indent for "Jawaban" and "Pembahasan"
              spacing: { line: 1.5 * 240 }, // 1.5 line spacing
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
              // Paragraph for questions
              return new Paragraph({
                text: line,
                style: "question",
              });
            } else if (optionRegex.test(line)) {
              // Paragraph for options
              return new Paragraph({
                text: line,
                style: "option",
              });
            } else if (line.includes("Jawaban:") || line.includes("Pembahasan:")) {
              // Paragraph for "Jawaban" or "Pembahasan"
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
              // Paragraph for any other content
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
    <div className="App" style={{ padding: '20px' }}>
      <h2>JSON to Markdown to Word Converter</h2>
      <p>Masukkan JSON di bawah ini dan hasilkan Markdown serta file Word yang dapat diunduh.</p>

      <div>
        <label htmlFor="jsonInput">Masukkan JSON:</label>
        <textarea
          id="jsonInput"
          rows="10"
          value={jsonInput}
          onChange={handleJsonInputChange}
          placeholder="Masukkan JSON di sini"
          style={{
            width: '100%',
            margin: '10px 0',
            padding: '10px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <div>
        <label htmlFor="markdownOutput">Hasil Markdown:</label>
        <textarea
          id="markdownOutput"
          rows="10"
          value={markdownOutput}
          readOnly
          placeholder="Hasil markdown akan muncul di sini..."
          style={{
            width: '100%',
            margin: '10px 0',
            padding: '10px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <button
        onClick={convertToDocx}
        style={{
          padding: '10px 15px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        Convert to Word (DOCX)
      </button>
    </div>
  );
}

export default App;
