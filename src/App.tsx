import React from "react";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";
import Grid from "@mui/material/Grid";
import Papa from "papaparse";
import MLMap, { CustomGeoJsonFeatureType } from "./components/MLMap";

function App() {
  const [geojsonFeatureCollection, setGeojsonFeatureCollection] =
    React.useState<CustomGeoJsonFeatureType[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const csvFile = require("./assets/data/data.csv");
        const response = await fetch(csvFile);

        const reader = response?.body?.getReader();
        const result = await reader?.read();
        const decoder = new TextDecoder("utf-8");
        const csvData = decoder.decode(result?.value);
        const jsonData = Papa.parse(csvData, { header: true }).data;
        const featureCollection: CustomGeoJsonFeatureType[] = [];
        jsonData.forEach((data: any) => {
          const formatedLon = parseFloat(data["Longitude"].replace(",", "."));
          const formatedLat = parseFloat(data["Latitude"].replace(",", "."));
          if (!isNaN(formatedLon) && !isNaN(formatedLat)) {
            featureCollection.push({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [formatedLon, formatedLat],
              },
              properties: {
                name: data["Business Name"],
                simplifiedMarketSegment:
                  data["Simplified Market Segment (GFC2)"],
              },
            });
          }
        });
        setGeojsonFeatureCollection(featureCollection);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  React.useEffect(() => {
    console.log("geojsonFeatureCollection", geojsonFeatureCollection);
  }, [geojsonFeatureCollection]);

  return (
    <div className="App">
      <Grid container sx={{ justifyContent: "space-between", px: 2, mt: 10 }}>
        <Grid item xs={12} md={8}>
          <MLMap featuresList={geojsonFeatureCollection} />
        </Grid>
        <Grid
          item
          xs={3}
          sx={{ backgroundColor: "lightgrey", borderRadius: 6 }}
        >
          Filters
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
