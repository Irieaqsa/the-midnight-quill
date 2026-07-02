import { useState, useRef } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Upload, X } from 'lucide-react';

// Validation schemas matching database constraints
const profileSchema = z.object({
  displayName: z.string().max(100, 'Display name must be 100 characters or less').optional(),
  username: z.string().max(50, 'Username must be 50 characters or less').regex(/^[a-z0-9_]*$/, 'Username can only contain lowercase letters, numbers, and underscores').optional(),
  bio: z.string().max(1000, 'Bio must be 1000 characters or less').optional(),
  website: z.string().max(200, 'Website must be 200 characters or less')
    .refine(val => !val || /^https?:\/\/.+/.test(val), 'Website must use http or https protocol')
    .optional().or(z.literal('')),
});

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
}

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onProfileUpdated: () => void;
}

export function ProfileEditDialog({ 
  open, 
  onOpenChange, 
  profile, 
  onProfileUpdated 
}: ProfileEditDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Please choose an image under 2MB.",
          variant: "destructive"
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return avatarUrl || null;

    setUploadingAvatar(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return `${data.publicUrl}?t=${Date.now()}`;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
      return avatarUrl || null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate inputs before saving
    const validation = profileSchema.safeParse({
      displayName: displayName.trim() || undefined,
      username: username.trim() || undefined,
      bio: bio.trim() || undefined,
      website: website.trim() || undefined,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    setSaving(true);
    
    try {
      // Upload avatar first if changed
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        finalAvatarUrl = uploadedUrl || '';
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
          website: website.trim() || null,
          avatar_url: finalAvatarUrl || null
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved."
      });

      onProfileUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = avatarPreview || avatarUrl;
  const displayNameForInitial = displayName || username || 'U';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information visible to other users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={currentAvatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-display">
                  {displayNameForInitial.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {currentAvatar && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={removeAvatar}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload Photo
            </Button>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                maxLength={100}
              />
              {validationErrors.displayName && (
                <p className="text-sm text-destructive mt-1">{validationErrors.displayName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                maxLength={50}
              />
              {validationErrors.username && (
                <p className="text-sm text-destructive mt-1">{validationErrors.username}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="resize-none"
                rows={3}
                maxLength={1000}
              />
              {validationErrors.bio && (
                <p className="text-sm text-destructive mt-1">{validationErrors.bio}</p>
              )}
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                maxLength={200}
              />
              {validationErrors.website && (
                <p className="text-sm text-destructive mt-1">{validationErrors.website}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
