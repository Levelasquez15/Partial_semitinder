import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Supabase {
  private supabase: SupabaseClient;

  constructor() {
    if (!environment.supabaseUrl || !environment.supabaseKey) {
      console.warn('[Supabase] Missing environment.supabaseUrl or environment.supabaseKey');
    }
    // Reuse a single Supabase client across HMR reloads to avoid multiple instances competing for navigator locks
    const g = (globalThis as any);
    if (!g.__supabaseClient) {
      g.__supabaseClient = createClient(
        environment.supabaseUrl || '',
        environment.supabaseKey || ''
      );
    }
    this.supabase = g.__supabaseClient as SupabaseClient;
  }

  /**
   * Subir una foto a Supabase Storage
   * @param file El archivo a subir
   * @param bucket El bucket donde se guardará (ej: 'profiles', 'photos')
   * @param userId El ID del usuario
   * @returns La URL pública de la foto subida
   */
  async uploadPhoto(file: Blob, bucket: string, userId: string): Promise<string> {
    try {
      const fileName = `${userId}/${Date.now()}.jpg`;
      const { error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg'
        });

      if (error) throw error;

      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  /**
   * Eliminar una foto de Supabase Storage
   * @param photoUrl La URL de la foto a eliminar
   * @param bucket El bucket donde está la foto
   */
  async deletePhoto(photoUrl: string, bucket: string): Promise<void> {
    try {
      const urlParts = photoUrl.split(`/${bucket}/`);
      if (urlParts.length < 2) return;
      const filePath = urlParts[1];

      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  /**
   * Listar fotos de un usuario
   * @param bucket El bucket donde buscar
   * @param userId El ID del usuario
   */
  async listPhotos(bucket: string, userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing photos:', error);
      return [];
    }
  }
}
