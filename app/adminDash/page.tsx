'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { motion } from "framer-motion"
import {  Table,  TableBody,  TableCaption,  TableCell,  TableFooter,  TableHead,  TableHeader,  TableRow,} from "@/components/ui/table"
import { FaPencilAlt } from "@react-icons/all-files/fa/FaPencilAlt"
import { FaTrashAlt } from "@react-icons/all-files/fa/FaTrashAlt"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';

interface Resource {
  id?: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  rating: number;
  description: string;
  image: string;
}

const AdminDashboard = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resourceData, setResourceData] = useState<Resource>({
    name: '',
    type: '',
    address: '',
    latitude: 0,
    longitude: 0,
    openingHours: '',
    rating: 0,
    description: '',
    image: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentUser } = useAuth();

  const fetchResources = async () => {
    if (currentUser) {
      try {
        const response = await axios.get('/api/resources');
        setResources(response.data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    }
  };

  useEffect(() => {
    fetchResources();
  }, [currentUser]);

  const handleSave = async () => {
    const resourceToSave = { ...selectedResource }; // Ensure resourceToSave is a plain object

    if (imageFile) {
      const storage = getStorage();
      const storageRef = ref(storage, `images/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      resourceToSave.image = downloadURL;
    }

    try {
      if (resourceToSave.id) {
        await axios.put(`/api/resources?id=${resourceToSave.id}`, resourceToSave);
      } else {
        await axios.post('/api/resources', resourceToSave);
      }
      fetchResources();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/resources?id=${id}`);
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };


  const fadeInAnimationsVariants={
    initial:{
      opacity:0,
      y:100
    },
    animate: (index:number) => ({
      opacity:1,
      y:0,
      transition:{
        delay:0.05*index
      }
    }
  )
  }

  return (
    <div>
        <motion.div
      variants={fadeInAnimationsVariants}
   initial="initial" whileInView="animate"
   viewport={{once:true}}
   custom={2} className="relative overflow-hidden flex  px-10 py-10 md:p-10 text-white bg-slate-800">
        <div className="flex flex-col  mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 border-b border-slate-600 pb-2 text-3xl font-bold tracking-tight first:mt-0">
            Admin Dashboard
            </h3>
          </div>
          <div>
            <p className="leading-7 text-white font-semibold">
          Add your resources
            </p>
          </div>
        </div>
        </motion.div>

          <div className='flex relative justify-end right-4'>
    <Button variant='purple' className=' my-4 flex justify-end' onClick={() => { setSelectedResource(null); setResourceData({
      name: '',
      type: '',
      address: '',
      latitude: 0,
      longitude: 0,
      openingHours: '',
      rating: 0,
      description: '',
      image: ''
    }); setIsDialogOpen(true); }}>Add Resource</Button>
    </div>

    <motion.div
      variants={fadeInAnimationsVariants}
   initial="initial" whileInView="animate"
   viewport={{once:true}}
   custom={10}>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Edit</TableHead>
          <TableHead className="w-[100px]">Reference</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
      {resources.map(resource => (
          <TableRow key={resource.id} className='border-b bg-white  border-gray-300 hover:bg-gray-100'>
            <TableCell onClick={()=>{setSelectedResource(resource); setResourceData(resource);setIsDialogOpen(true)}}
              className='cursor-pointer'><FaPencilAlt/></TableCell>
            <TableCell className="font-medium">{resource.id}</TableCell>
            <TableCell>{resource.name}</TableCell>
            <TableCell>{resource.type}</TableCell>
            <TableCell>{resource.address}</TableCell>
            <TableCell>{resource.rating}</TableCell>
            <TableCell className="text-right justify-center flex cursor-pointer">
            {/* <Button variant='outline' onClick={() => { setSelectedResource(resource); setResourceData(resource); setIsDialogOpen(true); }}>Edit</Button> */}
            <FaTrashAlt onClick={() => handleDelete(resource.id!)}/>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </motion.div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedResource?.id ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
          </DialogHeader>
          <div>
          <div className="flex gap-4">
          <div className="flex-1">
          <Label htmlFor="senderEmail" className="text-right">
               Name:
              </Label>
            <Input
              type="text"
              placeholder="Name"
              value={resourceData.name}
              onChange={e => setResourceData({ ...resourceData, name: e.target.value })}
            />
            </div>
            <div className="flex-1">
             <Label htmlFor="senderEmail" className="text-right">
              Type:
              </Label>
            <Input
              type="text"
              placeholder="Type"
              value={resourceData.type}
              onChange={e => setResourceData({ ...resourceData, type: e.target.value })}
            />
            </div>
            </div>
             <Label htmlFor="senderEmail" className="text-right">
               Address:
              </Label>
            <Input
              type="text"
              placeholder="Address"
              value={resourceData.address}
              onChange={e => setResourceData({ ...resourceData, address: e.target.value })}
            />
              <div className="flex gap-4">
              <div className="flex-1">
             <Label htmlFor="senderEmail" className="text-right">
              Latitude:
              </Label>
            <Input
              type="number"
              placeholder="Latitude"
              value={resourceData.latitude}
              onChange={e => setResourceData({ ...resourceData, latitude: +e.target.value })}
            />
            </div>
            <div className="flex-1">
             <Label htmlFor="senderEmail" className="text-right">
              Longitude:
              </Label>
            <Input
              type="number"
              placeholder="Longitude"
              value={resourceData.longitude}
              onChange={e => setResourceData({ ...resourceData, longitude: +e.target.value })}
            />
            </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
             <Label htmlFor="senderEmail" className="text-right">
               Opening Hours:
              </Label>
            <Input
              type="text"
              placeholder="Opening Hours"
              value={resourceData.openingHours}
              onChange={e => setResourceData({ ...resourceData, openingHours: e.target.value })}
            />
            </div>
            <div className="flex-1">
             <Label htmlFor="senderEmail" className="text-right">
               Rating:
              </Label>
            <Input
              type="number"
              placeholder="Rating"
              value={resourceData.rating}
              onChange={e => setResourceData({ ...resourceData, rating: +e.target.value })}
            />
            </div>
            </div>
             <Label htmlFor="senderEmail" className="text-right">
               Description:
              </Label>
            <Input
              type="text"
              placeholder="Description"
              value={resourceData.description}
              onChange={e => setResourceData({ ...resourceData, description: e.target.value })}
            />
             <Label htmlFor="senderEmail" className="text-right">
               Image URL:
              </Label>
            <Input
            type="file"
             onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
            />
            {/* {selectedResource?.image && (
                <Image src={selectedResource.image} width={200} height={200} alt='img' />
              )} */}
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
