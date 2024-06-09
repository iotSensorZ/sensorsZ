// pages/edit/[id].tsx
import FileEdit from '@/components/fileedit/page';

const EditPage = ({ params }: { params: { id: string } }) => {
  return <FileEdit fileId={params.id} />;
};

export default EditPage;
