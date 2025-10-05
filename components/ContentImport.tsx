'use client';
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useRef } from "react";

export default function ContentImport({ onAdd }:{ onAdd: (rows: any[]) => void }) {
  const inputRef = useRef<HTMLInputElement|null>(null);
  function open(){ inputRef.current?.click(); }

  function handleFile(file: File){
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (res:any) => onAdd((res?.data||[]).map(normalize)),
      });
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const wb = XLSX.read(reader.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];
        onAdd(json.map(normalize));
      };
      reader.readAsBinaryString(file);
    }
  }
  function normalize(r:any){
    return {
      number: Number(r["numero da Aula"] ?? r["Aula"] ?? r["Número"] ?? r["Numero"] ?? r["number"] ?? r["num"] ?? 0),
      title: r["Título"] ?? r["Titulo"] ?? r["title"] ?? "",
      content: r["Conteúdo da Aula"] ?? r["Conteudo da Aula"] ?? r["content"] ?? "",
      objectives: r["Objetivos"] ?? r["objectives"] ?? "",
      activities: r["Desenvolvimento das Atividades"] ?? r["activities"] ?? "",
      resources: r["Recursos Didáticos"] ?? r["Recursos Didaticos"] ?? r["resources"] ?? "",
      bncc: r["BNCC"] ?? r["bncc"] ?? "",
    };
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden"
        onChange={(e)=>{ const f=e.target.files?.[0]; if(f) handleFile(f); e.currentTarget.value=""; }}/>
      <button type="button" onClick={open}
        className="rounded-2xl border px-3 py-2 text-sm hover:border-blue-500 hover:text-blue-600">
        Importar por planilha (CSV/XLSX)
      </button>
    </>
  );
}
