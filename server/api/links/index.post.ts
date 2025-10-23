import { createSupabaseServerClient } from '../../utils/supabase.server';
import { createError, readMultipartFormData } from 'h3';
import authGuard from '../_authGard';
import { validateLinkIcon, generateSafeFilename } from '../../utils/fileUpload';
import { validateUrl, sanitizeString } from '../../utils/validation';

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

  // Validate required fields
  if (!title || !url || !icon) {
    throw createError({
      statusCode: 400,
      message: 'Titre, URL ou icône manquants',
    });
  }

  // Sanitize and validate title
  const sanitizedTitle = sanitizeString(title);
  if (sanitizedTitle.length < 1 || sanitizedTitle.length > 100) {
    throw createError({
      statusCode: 400,
      message: 'Le titre doit faire entre 1 et 100 caractères',
    });
  }

  // Sanitize and validate URL
  const sanitizedUrl = sanitizeString(url);
  if (!validateUrl(sanitizedUrl)) {
    throw createError({
      statusCode: 400,
      message: 'URL invalide. Seuls http:// et https:// sont autorisés',
    });
  }

  // SECURITY: Validate icon file before upload (type, size, signature)
  validateLinkIcon(icon);

  // Generate secure filename
  const fileName = generateSafeFilename(user.id, icon.filename);

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
      title: sanitizedTitle,
      user_id: user.id,
      url: sanitizedUrl,
      icon: iconUrl,
    })
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la création du lien',
    });
  }

  return { data: link };
});
