import QuillEditor from '@/components/quill/page';

const WriteReportPage = () => {
  return (
    <div className="container mx-auto p-4 bg-white rounded-2xl">

      <h1 className="text-2xl font-bold mb-4">Write Report</h1>
      <QuillEditor />
    </div>
  );
};

export default WriteReportPage;
