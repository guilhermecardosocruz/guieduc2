'use client';

import { useCallback, useRef, useState } from "react";
import type { Student } from "./EditableStudentList";

type Props = {
  classId: string;
  existing: Student[];
  onAdd: (added: Student[]) => void; // devolve apenas os novos adicionados
};

const ACCEPT = [
  ".csv",
  ".xlsx",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");

const normalize = (s?: string | null) => (s ?? "").trim();

function parseCSV(text: string) {
  const rows = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!rows.length) return [] as Record<string,string>[];
  const split = (row: string) =>
    row.split(/[,;](?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.trim().replace(/^"+|"+$/g, ""));
  const header = split(rows.shift()!.toLowerCase());
  const data: Record<string,string>[] = [];
  for (const r of rows) {
    const cols = split(r);
    const obj: Record<string,string> = {};
    header.forEach((h, i) => { obj[h] = cols[i] ?? ""; });
    data.push(obj);
  }
  return data;
}

async function parseXLSX(file: File) {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
  // normaliza chaves p/ minúsculas
  return json.map(row => {
    const out: Record<string, string> = {};
    Object.keys(row).forEach(k => out[k.toLowerCase()] = String(row[k] ?? "").trim());
    return out;
  });
}

function toStudents(rows: Record<string,string>[], existingNames: Set<string>): Student[] {
  // mapeia colunas
  const aliasNome = ["nome","name"];
  const aliasCpf = ["cpf"];
  const aliasContato = ["contato","contact","telefone","celular","contato/telefone","email","e-mail"];

  return rows.map(r => {
    const keys = Object.keys(r);
    const get = (aliases: string[]) =>
      normalize(keys.find(k => aliases.includes(k)) ? r[keys.find(k => aliases.includes(k)) as string] : "");
    const name = get(aliasNome) || normalize(r[keys[0]]); // fallback: primeira coluna
    const cpf = get(aliasCpf) || undefined;
    const contact = get(aliasContato) || undefined;
    return { name, cpf, contact };
  })
  .filter(s => s.name && !existingNames.has(s.name))
  .map(s => ({ id: crypto.randomUUID(), ...s }));
}

export default function StudentImport({ classId, existing, onAdd }: Props) {
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    setError("");
    if (!files || files.length === 0) return;
    const f = files[0];
    setFileName(f.name);

    try {
      let rows: Record<string,string>[] = [];
      const ext = f.name.toLowerCase().split(".").pop() || "";
      if (ext === "xlsx") {
        rows = await parseXLSX(f);
      } else {
        const text = await f.text();
        rows = parseCSV(text);
      }
      if (!rows.length) { setError("Arquivo vazio ou não reconhecido."); return; }

      const existingNames = new Set(existing.map(s => s.name));
      const students = toStudents(rows, existingNames);
      if (!students.length) {
        setError("Nenhum aluno novo para adicionar. Verifique se a coluna 'nome' está preenchida.");
        return;
      }
      onAdd(students);
      setError("");
    } catch (e) {
      setError("Falha ao ler o arquivo. Verifique o formato (CSV/XLSX) e tente novamente.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [existing, onAdd]);

  function downloadCSVTemplate() {
    const csv = "nome,cpf,contato\nAluno 1,123.456.789-00,(11) 99999-0000\nAluno 2,,aluno2@email.com\nAluno 3,,\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "alunos-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadXLSXTemplate() {
    const XLSX = await import("xlsx");
    const data = [
      { nome: "Aluno 1", cpf: "123.456.789-00", contato: "(11) 99999-0000" },
      { nome: "Aluno 2", cpf: "", contato: "aluno2@email.com" },
      { nome: "Aluno 3", cpf: "", contato: "" },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "alunos");
    const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "alunos-template.xlsx"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium">Adicionar alunos por planilha (CSV ou XLSX)</div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`mb-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          drag ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14m-7-7h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <div className="text-sm">
          <strong>Clique para selecionar</strong> ou arraste seu arquivo aqui
        </div>
        <div className="mt-1 text-xs text-gray-500">Formatos aceitos: CSV, XLSX</div>
        {fileName && <div className="mt-2 text-xs text-gray-600">Selecionado: {fileName}</div>}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={downloadCSVTemplate}
          className="rounded-full border px-3 py-1 text-xs transition hover:border-blue-500 hover:text-blue-600"
        >
          Baixar modelo CSV
        </button>
        <button
          type="button"
          onClick={downloadXLSXTemplate}
          className="rounded-full border px-3 py-1 text-xs transition hover:border-blue-500 hover:text-blue-600"
        >
          Baixar modelo XLSX
        </button>
        <span className="text-[11px] text-gray-500">
          Colunas: <code>nome</code> (obrigatório), <code>cpf</code> (opcional), <code>contato</code> (opcional)
        </span>
      </div>
    </div>
  );
}
