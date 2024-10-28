"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { RefreshCw, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { PollRecord } from "@/app/api/upload-poll/route";
import { Municipality } from "@/app/api/sync-ibge/route";

const ElectionDashboard = () => {
  const [pollData, setPollData] = useState<PollRecord[]>([]);
  const [ibgeData, setIbgeData] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);

  const getMunicipalityGroup = (population: number): number => {
    if (population <= 20000) return 1;
    if (population <= 100000) return 2;
    if (population <= 1000000) return 3;
    return 4;
  };

  const getGroupWeight = (group: number): number => {
    switch (group) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 3:
        return 3;
      case 4:
        return 4;
      default:
        return 1;
    }
  };

  const processData = (pollRecords: PollRecord[]) => {
    const dateGroups = pollRecords.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = [];
      }
      acc[curr.date].push(curr);
      return acc;
    }, {} as Record<string, PollRecord[]>);

    const processed = Object.entries(dateGroups).map(([date, records]) => {
      const weightedVotes = {
        A: 0,
        B: 0,
        totalWeight: 0,
      };

      records.forEach((record) => {
        const municipalityData = ibgeData.find(
          (m) => m.name === record.municipality && m.state === record.state
        );

        if (municipalityData) {
          const group = getMunicipalityGroup(municipalityData.population);
          const weight = getGroupWeight(group);

          if (record.vote === "A") {
            weightedVotes.A += weight;
          } else {
            weightedVotes.B += weight;
          }
          weightedVotes.totalWeight += weight;
        }
      });

      const weightedPercentageA =
        (weightedVotes.A / weightedVotes.totalWeight) * 100;
      const weightedPercentageB =
        (weightedVotes.B / weightedVotes.totalWeight) * 100;

      return {
        date,
        "Candidato A": weightedPercentageA.toFixed(2),
        "Candidato B": weightedPercentageB.toFixed(2),
      };
    });

    processed.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setAggregatedData([...aggregatedData, ...processed]);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setUploadStatus("error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data: requestData, status } = await axios<PollRecord[]>(
        "/api/upload-poll",
        {
          method: "POST",
          data: formData,
        }
      );

      if (status !== 200) throw new Error("Upload failed");

      setPollData(requestData);
      if (ibgeData.length > 0) {
        processData(requestData);
      }
      setUploadStatus("success");
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const updateIBGEData = async () => {
    setLoading(true);
    try {
      const { data, status } = await axios.get<Municipality[]>(
        "/api/sync-ibge"
      );

      if (status !== 200) throw new Error("Update failed");

      setIbgeData(data);
      if (pollData.length > 0) {
        processData(pollData);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error updating IBGE data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            Pesquisa de Intenção de Votos (Ponderada por População)
          </CardTitle>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button disabled={loading} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
            </div>
            <Button
              onClick={updateIBGEData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar Base IBGE
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {uploadStatus === "success" && (
            <Alert className="mb-4 bg-green-50">
              <AlertDescription>
                Arquivo CSV processado com sucesso!
              </AlertDescription>
            </Alert>
          )}
          {uploadStatus === "error" && (
            <Alert className="mb-4 bg-red-50">
              <AlertDescription>
                Erro ao processar o arquivo. Certifique-se de que é um CSV
                válido.
              </AlertDescription>
            </Alert>
          )}

          {ibgeData.length === 0 && (
            <Alert className="mb-4 bg-yellow-50">
              <AlertDescription>
                Por favor, atualize a base do IBGE antes de fazer upload dos
                dados da pesquisa.
              </AlertDescription>
            </Alert>
          )}

          {aggregatedData.length > 0 ? (
            <div className="mt-6">
              <div className="h-[400px] w-full">
                <LineChart
                  width={800}
                  height={400}
                  data={aggregatedData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Candidato A"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Candidato B"
                    stroke="#82ca9d"
                  />
                </LineChart>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Faça upload de um arquivo CSV para visualizar os dados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectionDashboard;
