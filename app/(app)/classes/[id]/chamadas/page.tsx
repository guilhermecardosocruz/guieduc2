import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function CallsPage({ params }: { params: { id: string } }) {
  const items = await prisma.attendance.findMany({
    where: { classId: params.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chamadas</h1>
        <Link
          href={`/classes/${params.id}/chamadas/new`}
          className="rounded-xl px-4 py-2 bg-blue-600 text-white"
        >
          Nova chamada
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-600">Nenhuma chamada ainda.</p>
      ) : (
        <ul className="divide-y border rounded-xl">
          {items.map((c) => (
            <li key={c.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">Chamada</div>
                <div className="text-xs text-gray-500">
                  {new Date(c.createdAt as unknown as string).toLocaleString()}
                </div>
              </div>
              {/* Se tiver tela de detalhes: */}
              {/* <Link href={`/classes/${params.id}/chamadas/${c.id}`} className="text-blue-600 underline text-sm">Abrir</Link> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
