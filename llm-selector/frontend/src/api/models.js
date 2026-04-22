import api from "./axios";

export const getModels = (params) => api.get("/models/", { params });
export const getModel  = (id)     => api.get(`/models/${encodeURIComponent(id)}`);
export const compareModels = (model_ids) => api.post("/models/compare", { model_ids });

export const recommend = (payload)  => api.post("/recommend/", payload);
export const getHistory = ()        => api.get("/recommend/history");

export const calculate = (payload)  => api.post("/calculate/", payload);

export const syncAll         = () => api.post("/sync/all");
export const syncOpenRouter  = () => api.post("/sync/openrouter");
export const syncAA          = () => api.post("/sync/aa");

export const runPromptLab = (payload) => api.post("/prompt-lab/run", payload);
export const getPromptLabHistory = (params) => api.get("/prompt-lab/history", { params });
