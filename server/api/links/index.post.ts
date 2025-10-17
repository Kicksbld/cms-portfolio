import { createSupabaseServerClient } from '../../utils/supabase.server';
import { createError, readMultipartFormData } from 'h3';
import authGuard from '../_authGard';

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const supabase = createSupabaseServerClient(event);
  const form = await readMultipartFormData(event);

  if (!form) {
    throw createError({ statusCode: 400, message: 'Aucun formData reçu' });
  }

  const title = form.find((f) => f.name === 'title')?.data?.toString();
  const url = form.find((f) => f.name === 'url')?.data?.toString();
  const icon = form.find((f) => f.name === 'icon');
  console.log(title, url, icon);

  if (!title || !url || !icon) {
    throw createError({
      statusCode: 400,
      message: 'Titre, URL ou icône manquants',
    });
  }

  const fileName = `${user.id}-${Date.now()}-${icon.filename}`;
  const { error: uploadError } = await supabase.storage
    .from('icons')
    .upload(fileName, icon.data, {
      contentType: icon.type,
    });

  if (uploadError) {
    throw createError({
      statusCode: 500,
      message: `Erreur upload image : ${uploadError.message}`,
    });
  }

  const { data: publicUrlData } = supabase.storage
    .from('icons')
    .getPublicUrl(fileName);

  const iconUrl = publicUrlData.publicUrl;

  const { data: link, error } = await supabase
    .from('link')
    .insert({
      title,
      user_id: user.id,
      url,
      icon: iconUrl,
    })
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Erreur création link : ${error.message}`,
    });
  }

  return { data: link };
});
