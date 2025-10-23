import { createSupabaseServerClient } from '../../../utils/supabase.server';
import { createError, readMultipartFormData } from 'h3';
import authGuard from '../../_authGard';
import { validateLinkIcon, generateSafeFilename } from '../../../utils/fileUpload';
import { validateUrl, sanitizeString } from '../../../utils/validation';

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

  // CRITICAL SECURITY: Verify link ownership BEFORE file upload
  const { data: existingLink, error: linkError } = await supabase
    .from('link')
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (linkError || !existingLink) {
    throw createError({
      statusCode: 404,
      message: 'Lien non trouvé ou accès non autorisé',
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
  } = {};

  // Validate and sanitize title if provided
  if (title) {
    const sanitizedTitle = sanitizeString(title);
    if (sanitizedTitle.length < 1 || sanitizedTitle.length > 100) {
      throw createError({
        statusCode: 400,
        message: 'Le titre doit faire entre 1 et 100 caractères',
      });
    }
    updateData.title = sanitizedTitle;
  }

  // Validate and sanitize URL if provided
  if (url) {
    const sanitizedUrl = sanitizeString(url);
    if (!validateUrl(sanitizedUrl)) {
      throw createError({
        statusCode: 400,
        message: 'URL invalide. Seuls http:// et https:// sont autorisés',
      });
    }
    updateData.url = sanitizedUrl;
  }

  // Handle icon upload if provided
  if (iconFile) {
    // SECURITY: Validate file before upload (type, size, signature)
    validateLinkIcon(iconFile);

    // Generate secure filename
    const fileName = generateSafeFilename(user.id, iconFile.filename);

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
