import { NextResponse, NextRequest } from "next/server";
import { parse } from "csv-parse/sync";

export type PollRecord = {
  searchId: string;
  date: string;
  municipality: string;
  state: string;
  vote: "A" | "B";
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileText = await (file as File).text();

    const records = parse(fileText, {
      delimiter: ",",
      columns: true,
      skip_empty_lines: true,
      encoding: "utf-8",
    });

    const cleanedRecords = records.map((record: any) => {
      if (Object.keys(record).some((key) => key === "#N/D")) {
        return;
      }
      return {
        searchId: record.ID_PESQUISA,
        date: record.DATA_PESQUISA,
        municipality: record.MUNICÍPIO,
        state: record.ESTADO,
        vote: record["INTENÇÃO DE VOTO"],
      };
    });

    return NextResponse.json(cleanedRecords);
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
