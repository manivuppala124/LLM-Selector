import api from "./axios";

export const getModels = (params) => api.get("/models/", { params });
export const getModel  = (id)     => api.get(`/models/${encodeURIComponent(id)}`);

export const recommend = (payload)  => api.post("/recommend/", payload);
export const getHistory = ()        => api.get("/recommend/history");

export const calculate = (payload)  => api.post("/calculate/", payload);
export const compare   = (modelIds) => api.post("/compare/", { model_ids: modelIds });

export const syncAll         = () => api.post("/sync/all");
export const syncOpenRouter  = () => api.post("/sync/openrouter");
export const syncAA          = () => api.post("/sync/aa");
