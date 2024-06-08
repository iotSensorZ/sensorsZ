// pages/storage.js

import FileList from '../../components/filelist/page';
import FileUpload from '../../components/fileupload/page';

const StoragePage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Storage Space</h1>
      <FileUpload />
    </div>
  );
};

export default StoragePage;
