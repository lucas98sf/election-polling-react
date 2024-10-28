import { NextResponse } from "next/server";
import axios from "axios";
import * as xlsx from "xlsx";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export type Municipality = {
  state: string;
  name: string;
  population: number;
};

export type ExcelData = {
  success: boolean;
  data?: Municipality[];
  error?: string;
};

const DATA_DIR = path.join(process.cwd(), "public", "data");
const JSON_FILE_PATH = path.join(DATA_DIR, "municipalities.json");

async function ensureDirectoryExists() {
  try {
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating directory:", error);
    throw new Error("Failed to create data directory");
  }
}

async function processExcelFile(buffer: Buffer): Promise<ExcelData> {
  try {
    const workbook = xlsx.read(buffer);
    const sheetName = workbook.SheetNames[1];
    const worksheet = workbook.Sheets[sheetName];

    const rawData = xlsx.utils.sheet_to_json(worksheet, {
      raw: true,
      dateNF: "yyyy-mm-dd",
      defval: "",
      header: 1,
      blankrows: false,
    }) as any[][];

    const data: Municipality[] = [];

    for (let i = 2; i < rawData.length; i++) {
      const row = rawData[i];
      if (row && row[0] && row[3] && row[4]) {
        data.push({
          state: row[0].toString(),
          name: row[3].toString(),
          population: Number(row[4]),
        });
      }
    }

    await ensureDirectoryExists();

    await writeFile(
      JSON_FILE_PATH,
      JSON.stringify(
        {
          lastUpdated: new Date().toISOString(),
          total: data.length,
          data,
        },
        null,
        2
      )
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error processing file:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error processing Excel file",
    };
  }
}

async function getStoredData(): Promise<Municipality[] | null> {
  try {
    if (!existsSync(JSON_FILE_PATH)) {
      return null;
    }
    const fileContent = await readFile(JSON_FILE_PATH, "utf-8");
    const jsonData = JSON.parse(fileContent);
    return jsonData.data;
  } catch (error) {
    console.error("Error reading stored data:", error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get("refresh") === "true";

  try {
    if (!refresh) {
      const storedData = await getStoredData();
      if (storedData) {
        return NextResponse.json(storedData);
      }
    }

    const url =
      "https://ftp.ibge.gov.br/Estimativas_de_Populacao/Estimativas_2024/estimativa_dou_2024.xls";
    const response = await axios({
      method: "GET",
      url,
      responseType: "arraybuffer",
    });

    const result = await processExcelFile(response.data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to download or process file",
      },
      { status: 500 }
    );
  }
}
