import React from "react";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import Papa from "papaparse";
import MLMap from "./components/MLMap";
import "mapbox-gl/dist/mapbox-gl.css";

import "./App.css";
import {
  CustomGeoJsonFeatureType,
  OutletFeatureCollectionState,
} from "./modules/outlets/outletsSlice";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import {
  selectOutletFeatureCollection,
  setFeatures,
} from "./modules/outlets/outletsSlice";
import { Divider } from "@mui/material";

function App() {
  const dispatch = useAppDispatch();
  const outletsFeatureCollection = useAppSelector(
    selectOutletFeatureCollection
  );

  const [mapData, setMapData] = React.useState<
    OutletFeatureCollectionState | undefined
  >(undefined);
  const [simplifiedMarketSegmentList, setSimplifiedMarketSegmentList] =
    React.useState<string[]>([]);
  const [filterSMS, setFilterSMS] = React.useState("");
  const [searchFilter, setSearchFilter] = React.useState("");
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([
    2.213749, 46.227638,
  ]);
  const [mapZoom, setMapZoom] = React.useState(5);

  const handleChangeSMSFilter = React.useCallback(
    (event: SelectChangeEvent) => {
      setFilterSMS(event.target.value);
    },
    []
  );

  const clearFilters = React.useCallback(() => {
    setFilterSMS("");
    setSearchFilter("");
    setMapData(outletsFeatureCollection);
  }, [outletsFeatureCollection]);

  const applyFilters = React.useCallback(() => {
    const filtered = outletsFeatureCollection.features.filter((outlet) => {
      //Text search helper
      const outletName = outlet.properties.name.toLowerCase();
      const searchTermLower = searchFilter.toLowerCase().split("");
      const isTextSearchIncluded = searchTermLower.every((word) =>
        outletName.includes(word)
      );
      return (
        isTextSearchIncluded &&
        (filterSMS
          ? outlet.properties.simplifiedMarketSegment === filterSMS
          : true)
      );
    });

    //Updating mapData with filtered collection
    setMapData({ ...outletsFeatureCollection, features: filtered });
  }, [filterSMS, searchFilter, outletsFeatureCollection]);

  //Sumbit search filters
  const submitSearch = React.useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        //Access and read data file
        const csvFile = require("./assets/data/data.csv");
        const response = await fetch(csvFile);
        const reader = response?.body?.getReader();
        const result = await reader?.read();
        const decoder = new TextDecoder("utf-8");
        const csvData = decoder.decode(result?.value);
        const jsonData = Papa.parse(csvData, { header: true }).data;

        //Creating feature collection
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
                address: `${data["Main address"]} ${data["Address 2"]} ${data["Address 3"]}`,
                zipCode: data["Postal code"],
                city: data["City"],
              },
            });
          }
        });

        //Update redux store
        dispatch(setFeatures(featureCollection));
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, []);

  //Update simplifiedMarketSegmentList on outletsFeatureCollection change
  React.useEffect(() => {
    setMapData(outletsFeatureCollection);
    const availableSMS: string[] = [];
    outletsFeatureCollection.features.forEach((e) => {
      if (!availableSMS.includes(e.properties.simplifiedMarketSegment)) {
        availableSMS.push(e.properties.simplifiedMarketSegment);
      }
    });
    setSimplifiedMarketSegmentList(availableSMS);
  }, [outletsFeatureCollection]);

  return (
    <div className="App">
      <Grid container sx={{ justifyContent: "space-between", px: 2, mt: 10 }}>
        <Grid item xs={12} md={9} sx={{ pr: 2 }}>
          <Typography fontWeight={"bold"} textAlign="start">
            Outlet
          </Typography>
          {mapData && (
            <MLMap
              data={mapData}
              clusterRadius={20}
              center={mapCenter}
              zoom={mapZoom}
            />
          )}
        </Grid>
        <Grid item xs={12} md={3} sx={{ mt: { xs: 2, md: 0 } }}>
          <Paper
            sx={{
              borderRadius: 6,
              p: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
            elevation={6}
          >
            <Typography fontWeight={"bold"}>Filters</Typography>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <TextField
                  variant="standard"
                  onChange={(e) => setSearchFilter(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                  placeholder="Search by name"
                  value={searchFilter}
                  sx={{
                    backgroundColor: "#f5f7f6",
                    borderRadius: 6,

                    input: { px: 1, color: "#4d8fa9" },
                  }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel sx={{ color: "#4d8fa9" }}>
                  Select your market segment
                </InputLabel>
                <Select
                  value={filterSMS}
                  onChange={handleChangeSMSFilter}
                  fullWidth
                  disableUnderline
                  variant="standard"
                  sx={{
                    backgroundColor: "#f5f7f6",
                    borderRadius: 6,
                    px: 1,
                    color: "#4d8fa9",
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {simplifiedMarketSegmentList.map((e) => (
                    <MenuItem key={`SMS_${e}`} value={e}>
                      {e}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography textAlign="start" fontWeight={"bold"} sx={{ my: 2 }}>
                Visible outlets :
              </Typography>
              <Box sx={{ maxHeight: 250, overflow: "scroll" }}>
                {mapData?.features.map((e) => (
                  <Box
                    key={`feature_${e.properties.name}`}
                    sx={{
                      my: 1,
                      "&:hover": {
                        backgroundColor: "#0666881A",
                        cursor: "pointer",
                      },
                    }}
                    onClick={() => {
                      setMapCenter(e.geometry.coordinates as [number, number]);
                      setMapZoom(20);
                    }}
                  >
                    <Typography textAlign={"start"}>
                      {e.properties.name}
                    </Typography>
                    <Typography
                      textAlign={"start"}
                      fontSize={8}
                    >{`${e.properties.address}, ${e.properties.zipCode} ${e.properties.city}`}</Typography>
                    <Divider />
                  </Box>
                ))}
              </Box>
            </Box>
            <Grid container>
              <Grid item xs={12} md={6} sx={{ px: 1 }}>
                <Button
                  variant="contained"
                  onClick={clearFilters}
                  sx={{
                    backgroundColor: "#eb40341A",
                    color: "#eb4034",
                    fontWeight: "bold",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#eb403433",
                    },
                  }}
                  fullWidth
                  disabled={!searchFilter && !filterSMS}
                >
                  Clear
                </Button>
              </Grid>
              <Grid item xs={12} md={6} sx={{ px: 1, mt: { xs: 1, md: 0 } }}>
                <Button
                  variant="contained"
                  onClick={submitSearch}
                  sx={{
                    backgroundColor: "#066688",
                    color: "#fff",
                    fontWeight: "bold",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#066688B3",
                    },
                  }}
                  fullWidth
                  disabled={!searchFilter && !filterSMS}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
