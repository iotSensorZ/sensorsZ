'use client'
import React, { useEffect, useState } from 'react';
import Map, { Marker, Popup, ViewStateChangeEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
const MAP_TOKEN = 'pk.eyJ1Ijoic2hhZ3VuaW52ZW50YWkiLCJhIjoiY2x6MTNnNTZkMm9mbjJpcjRiaHhteXh1cSJ9.xlSRFEbugcLgZxi4mDfQ8A';
import {motion} from 'framer-motion'

interface Location {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  rating: number;
  image: string;
}
const locations = [
    {
      name: 'Hospital A',
      description: 'A leading healthcare facility.',
      address: '123 Main St, City, Country',
      latitude: 38.89511,
      longitude: -77.03637,
      openingHours: 'Mon-Fri 8am-8pm',
      rating: 4.5,
      image: 'https://via.placeholder.com/200',
      type:'hospital'
    },
    {
      name: 'School B',
      description: 'An excellent educational institution.',
      address: '456 Elm St, City, Country',
      latitude: 40.7128,
      longitude: -74.0060,
      openingHours: 'Mon-Fri 8am-3pm',
      rating: 4.8,
      image: 'https://via.placeholder.com/200',
      type:'school'
    }
    // Add more locations as needed
  ];

const MapComponent=()=>{
const [viewport ,setViewport]=useState({
    // latitude: 37.7749,
    // longitude: -122.4194,
    zoom: 3,
    center: [-98, 38.88],
    // width: '100vw',
    // height: '100vh'
});

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
const [hoveredMarker, setHoveredMarker] = useState<any>(null);
const [markers, setMarkers] = useState([]);
const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState<string>('');


  const handleViewportChange = (newViewport: any) => {
    setViewport({
      ...newViewport,
      latitude: newViewport.latitude,
      longitude: newViewport.longitude,
      zoom: newViewport.zoom
    });
  };
  const filteredLocations = locations.filter(location => 
    (filter === 'all' || location.type === filter) &&
    (location.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     location.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  return(
    <>
    
   <motion.div variants={fadeInAnimationsVariants}
   initial="initial" whileInView="animate"
  //  viewport={{once:true}}
   custom={2}
    style={{ width: '100%', height: '500px' }}>
   <div className="w-1/4 my-5">
          <Select onValueChange={(value) => setFilter(value)}>
            <SelectTrigger aria-label="Filter">
              <SelectValue placeholder="Select a filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="hospital">Hospitals</SelectItem>
              <SelectItem value="school">Schools</SelectItem>
              {/* Add more filter options as needed */}
            </SelectContent>
          </Select>
        </div>
        <input
            type="text"
            placeholder="Search by name or address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
      <Map
        {...viewport}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAP_TOKEN}
        onMove={evt => handleViewportChange(evt.viewState)}
        dragPan={true}
        dragRotate={true}
      >
                {filteredLocations.map(location => (
          <Marker 
            key={location.name}
            latitude={location.latitude}
            longitude={location.longitude}
            onClick={() => setSelectedMarker(location)}
          >
           <div style={{ transform: 'translate(-50%, -100%)' }}
           onMouseEnter={() => setHoveredMarker(location)}
           onMouseLeave={() => setHoveredMarker(null)}>
              <svg 
                height="20" 
                viewBox="0 0 24 24" 
                style={{ fill: 'red', stroke: 'none' }}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
              </svg>
            </div>
          </Marker>
                ))}

{hoveredMarker && (
          <Popup
            latitude={hoveredMarker.latitude}
            longitude={hoveredMarker.longitude}
            closeButton={false}
            anchor="top"
          >
            <div>
              <h2>{hoveredMarker.name}</h2>
              <p>{hoveredMarker.description}</p>
            </div>
          </Popup>
        )}
      </Map>


      <Dialog open={Boolean(selectedMarker)} onOpenChange={() => setSelectedMarker(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-center text-lg'>{selectedMarker?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 justify-center">
            <p>{selectedMarker?.description}</p>
            <p>{selectedMarker?.address}</p>
            <p>Hours: {selectedMarker?.openingHours}</p>
            <p>Rating: {selectedMarker?.rating}</p>
            <Image src={selectedMarker?.image} width={200} height={200} alt='img'/>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMarker(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </motion.div>
    </>
  )
}
export default MapComponent;