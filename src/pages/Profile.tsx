import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, User, Mail, Calendar, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const { profile, updateProfile, uploadAvatar, isUpdating } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');

  const userInitials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: fullName });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information</p>
        </div>

        {/* Avatar Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Profile Picture</CardTitle>
            <CardDescription>Click the avatar to upload a new photo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-background animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-background" />
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground mt-4">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </CardContent>
        </Card>

        {/* Personal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <Button type="submit" className="gradient-bg hover:opacity-90" disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Verified</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email_confirmed_at ? 'Yes' : 'Pending verification'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
