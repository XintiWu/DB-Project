import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix for default marker icon missing in React Leaflet
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    initialLat?: number
    initialLng?: number
    onLocationSelect: (lat: number, lng: number) => void
}

function LocationMarker({ position, setPosition, onSelect }: { 
    position: L.LatLngExpression | null, 
    setPosition: (pos: L.LatLngExpression) => void,
    onSelect: (lat: number, lng: number) => void 
}) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng)
            onSelect(e.latlng.lat, e.latlng.lng)
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    return position === null ? null : (
        <Marker position={position}></Marker>
    )
}

export function LocationPicker({ initialLat, initialLng, onLocationSelect }: LocationPickerProps) {
    // Default to Taiwan center if no initial coordinates
    const defaultCenter: [number, number] = [23.6978, 120.9605] 
    const center: [number, number] = (initialLat && initialLng) ? [initialLat, initialLng] : defaultCenter
    
    // UI State for position
    const [position, setPosition] = useState<L.LatLngExpression | null>(
        (initialLat && initialLng) ? [initialLat, initialLng] : null
    )

    useEffect(() => {
        // Sync props if they change externally (e.g. detailed loaded)
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng])
        }
    }, [initialLat, initialLng])

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border">
            <MapContainer 
                center={center} 
                zoom={8} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                    position={position} 
                    setPosition={setPosition} 
                    onSelect={onLocationSelect} 
                />
            </MapContainer>
        </div>
    )
}
