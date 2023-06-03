import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import GeoJSON, { Point } from "geojson";
import { RootState } from "../../app/store";

export type CustomGeoJsonOutletProperties = {
  name: string;
  simplifiedMarketSegment: string;
  address: string;
  zipCode: string;
  city: string;
};

export type CustomGeoJsonFeatureType = GeoJSON.Feature<
  Point,
  CustomGeoJsonOutletProperties
>;

export interface OutletFeatureCollectionState {
  type: "FeatureCollection";
  features: CustomGeoJsonFeatureType[];
}

const initialState: OutletFeatureCollectionState = {
  type: "FeatureCollection",
  features: [],
};

export const outletFeatureCollectionSlice = createSlice({
  name: "outletList",
  initialState,
  reducers: {
    setFeatures: (state, action: PayloadAction<CustomGeoJsonFeatureType[]>) => {
      state.features = action.payload;
    },
  },
});

export const selectOutletFeatureCollection = (state: RootState) => state.outlet;

export const { setFeatures } = outletFeatureCollectionSlice.actions;
export default outletFeatureCollectionSlice.reducer;
