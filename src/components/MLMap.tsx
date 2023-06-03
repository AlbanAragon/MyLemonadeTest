import React from "react";
import Map, { Source, Layer, LayerProps, MapRef } from "react-map-gl";
import { OutletFeatureCollectionState } from "../modules/outlets/outletsSlice";

type Props = {
  data: OutletFeatureCollectionState;
  clusterRadius?: number;
  zoom: number;
  center: [number, number];
};
const MLMap = (props: Props) => {
  const mapRef = React.useRef<MapRef | null>(null);

  const MAPBOX_TOKEN =
    "pk.eyJ1IjoiZHRoaWIiLCJhIjoiY2tod2FjcWpiNWJkaDM1bDZ5b2ZqeGVweiJ9.cRnbp_ra6HirjBUG0byyNA";

  const clusterLayer: LayerProps = {
    id: "clusters",
    type: "circle",
    source: "outlets",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#2596be",
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
      "circle-stroke-width": [
        "step",
        ["get", "point_count"],
        20 * 0.2,
        100 * 0.2,
        30 * 0.2,
        750 * 0.2,
        40 * 0.2,
      ],
      "circle-stroke-color": "#fff",
    },
  };

  const clusterCountLayer: LayerProps = {
    id: "cluster-count",
    type: "symbol",
    source: "outlets",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-size": 12,
    },
    paint: {
      "text-color": "#FFF",
    },
  };

  const unclusteredPointLayer: LayerProps = {
    id: "unclustered-point",
    type: "circle",
    source: "outlets",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#2596be",
      "circle-radius": 6,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  };

  React.useEffect(() => {
    if (mapRef && mapRef.current) {
      const map = mapRef.current.getMap();
      map.easeTo({
        center: [props.center[0], props.center[1]],
        duration: 1000,
        zoom: props.zoom,
        easing: (t) => t,
      });
    }
  }, [props.center, props.zoom]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: props.center[0],
        latitude: props.center[1],
        zoom: 5,
      }}
      style={{ width: "100%", height: 600, borderRadius: 6 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <Source
        id="outlets"
        type="geojson"
        data={props.data}
        cluster={true}
        clusterMaxZoom={10}
        clusterRadius={props.clusterRadius || 30}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredPointLayer} />
      </Source>
    </Map>
  );
};

export default MLMap;
