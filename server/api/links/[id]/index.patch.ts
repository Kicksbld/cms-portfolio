import { createSupabaseServerClient } from '../../../utils/supabase.server';
import { createError, readMultipartFormData } from 'h3';
import authGuard from '../../_authGard';

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const supabase = await createSupabaseServerClient(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID du link manquant',
    });
  }

  const form = await readMultipartFormData(event);
  if (!form)
    throw createError({ statusCode: 400, message: 'Aucun formData reçu' });

  const title = form.find((f) => f.name === 'title')?.data?.toString();
  const url = form.find((f) => f.name === 'url')?.data?.toString();
  const iconFile = form.find((f) => f.name === 'icon'); // fichier optionnel

  const updateData: {
    title?: string;
    url?: string;
    icon?: string;
  } = { title, url };

  if (iconFile) {
    const fileName = `${user.id}-${Date.now()}-${iconFile.filename}`;
    const { error: uploadError } = await supabase.storage
      .from('icons')
      .upload(fileName, iconFile.data, {
        contentType: iconFile.type,
        upsert: true,
      });

    if (uploadError)
      throw createError({
        statusCode: 500,
        message: `Erreur upload image : ${uploadError.message}`,
      });

    const { data: publicUrlData } = supabase.storage
      .from('icons')
      .getPublicUrl(fileName);
    updateData.icon = publicUrlData.publicUrl;
  }

  const { data: updatedLink, error } = await supabase
    .from('link')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error)
    throw createError({
      statusCode: 500,
      message: `Erreur mise à jour : ${error.message}`,
    });

  return { data: updatedLink };
});
