
import { Share2, Facebook, Twitter, Linkedin, Link2, Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

type SocialShareProps = {
  title: string;
  description?: string;
  url?: string;
};

export default function SocialShare({ title, description, url = window.location.href }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useApp();
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);
  
  const shareLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      color: "bg-blue-700 hover:bg-blue-800",
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5" />,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: "bg-gray-600 hover:bg-gray-700",
    }
  ];
  
  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: t('success'),
        description: t('linkCopied'),
      });
    });
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 text-tontine-purple hover:text-tontine-dark-purple transition-colors"
        aria-expanded={isOpen}
      >
        <Share2 className="h-5 w-5" />
        <span className="text-sm">{t('share')}</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-2 w-48 rounded-md bg-white shadow-lg dark:bg-gray-800 p-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${link.color} text-white rounded-md p-2 flex flex-col items-center justify-center text-xs transition-colors`}
              >
                {link.icon}
                <span className="mt-1">{link.name}</span>
              </a>
            ))}
            <button
              onClick={copyLink}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md p-2 flex flex-col items-center justify-center text-xs transition-colors"
            >
              <Link2 className="h-5 w-5" />
              <span className="mt-1">{t('copyLink')}</span>
            </button>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
