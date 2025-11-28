import { areaQueries } from '../db/queries/area.queries';

export class AreaService {
  async createArea(data: {
    name: string;
    metadata?: Record<string, any>;
  }) {
    const areaId = await areaQueries.create(data.name, data.metadata);
    return this.getAreaById(areaId);
  }

  async getAreaById(id: number) {
    const area = await areaQueries.findById(id);
    if (!area) {
      throw new Error('Area not found');
    }
    return this.formatArea(area);
  }

  async getAllAreas() {
    const areas = await areaQueries.findAll();
    return areas.map(this.formatArea);
  }

  async updateArea(id: number, updates: any) {
    await areaQueries.update(id, updates);
    return this.getAreaById(id);
  }

  async deleteArea(id: number) {
    await areaQueries.delete(id);
  }

  private formatArea(area: any) {
    return {
      id: area.id,
      name: area.name,
      metadata: area.metadata ? JSON.parse(area.metadata) : null,
      createdAt: area.created_at,
      updatedAt: area.updated_at,
    };
  }
}
