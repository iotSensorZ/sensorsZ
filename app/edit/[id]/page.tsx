// pages/edit/[id].tsx
import EditFile from '@/components/fileedit/page';

export default function EditFilePage({ params }: { params: { id: string } }) {
  return <EditFile params={params} />;
}
