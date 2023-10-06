import * as React from "react";
import { Action, ActionPanel, Form, Clipboard, showHUD } from "@raycast/api";
import fs from "node:fs";
import csv from "csv-parser";

export default function CsvToJson() {
  const [headers, setHeaders] = React.useState([] as string[]);
  const [selectedHeaders, setSelectedHeaders] = React.useState([] as string[]);
  const [rawData, setRawData] = React.useState([] as unknown[]);
  const tagRef = React.useRef<Form.TagPicker>(null);

  const handleFile = async (file: string) => {
    if (!file) return;

    const data = [] as unknown[];
    let availHeaders = [] as string[];

    await new Promise((resolve) => {
      fs.createReadStream(file)
        .pipe(csv())
        .on("headers", (headers) => {
          availHeaders = headers;
        })
        .on("data", (row) => {
          data.push(row);
        })
        .on("end", () => {
          resolve(headers);
        });
    });

    setHeaders(availHeaders);
    setRawData(data);
    await tagRef.current?.focus();
  };

  const onSubmit = async () => {
    const copiedData = rawData.map((row) => {
      const newRow = {} as Record<string, unknown>;
      selectedHeaders.forEach((h) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        newRow[h] = row[h];
      });
      return newRow;
    });

    await Clipboard.copy(JSON.stringify(copiedData));
    await showHUD(`Copied ${copiedData.length} rows to clipboard`);
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Generate" onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="file"
        title="CSV File"
        allowMultipleSelection={false}
        onChange={([file]) => handleFile(file)}
        ref={tagRef}
      />
      {headers.length > 0 && (
        <Form.TagPicker id="headers" title="Fields to include" onChange={(vals) => setSelectedHeaders(vals)}>
          {headers.map((h) => (
            <Form.TagPicker.Item value={h} title={h} key={h} />
          ))}
        </Form.TagPicker>
      )}
    </Form>
  );
}
