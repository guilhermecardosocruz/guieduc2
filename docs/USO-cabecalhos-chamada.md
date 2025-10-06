# Como usar os cabeçalhos na Nova/Editar chamada

## 1) Substituir o título + botões do topo do card
No arquivo da página de **Nova chamada**, importe e use:

```tsx
import ChamadaHeader from "@/components/ChamadaHeader";

// ...
<ChamadaHeader
  modo="novo"
  title={title}
  content={content}
  onAddStudentSave={handleAddStudent}
/>
import ListHeader from "@/components/ListHeader";
<ListHeader total={alunos.length} mostrarAdicionar onAddStudentSave={handleAddStudent} />
