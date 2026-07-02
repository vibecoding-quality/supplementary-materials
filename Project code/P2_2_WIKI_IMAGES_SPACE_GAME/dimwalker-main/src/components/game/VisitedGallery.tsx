import { X, CheckCircle } from 'lucide-react';
import { WikiImage, wikiImages, getImageById } from '@/data/wikiImages';

interface VisitedGalleryProps {
  visitedImageIds: Set<string>;
  onClose: () => void;
  onNavigate: (image: WikiImage) => void;
}

const VisitedGallery = ({ visitedImageIds, onClose, onNavigate }: VisitedGalleryProps) => {
  const visitedImages = Array.from(visitedImageIds)
    .map(id => getImageById(id))
    .filter((img): img is WikiImage => img !== undefined);

  const categories = ['Art', 'Space', 'Nature', 'Wildlife'];

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const handleNavigate = (e: React.MouseEvent, image: WikiImage) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(image);
  };

  return (
    <div 
      className="fixed inset-0 bg-background/95 backdrop-blur-md z-[100] overflow-auto"
      onClick={handleBackdropClick}
    >
      <div 
        className="max-w-4xl mx-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="hud-title text-2xl">Explored Dimensions</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {visitedImages.length} of {wikiImages.length} discovered
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors z-[101]"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(visitedImages.length / wikiImages.length) * 100}%` }}
          />
        </div>

        {categories.map(category => {
          const categoryImages = wikiImages.filter(img => img.category === category);
          const visitedInCategory = categoryImages.filter(img => visitedImageIds.has(img.id));

          return (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                {category}
                <span className="text-sm text-muted-foreground font-normal">
                  ({visitedInCategory.length}/{categoryImages.length})
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryImages.map(image => {
                  const isVisited = visitedImageIds.has(image.id);
                  
                  return (
                    <div
                      key={image.id}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        isVisited 
                          ? 'border-accent opacity-100 cursor-pointer hover:scale-105' 
                          : 'border-muted opacity-40 grayscale cursor-not-allowed'
                      }`}
                      onClick={(e) => isVisited && handleNavigate(e, image)}
                    >
                      <div className="aspect-video bg-muted">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs font-medium truncate">
                          {isVisited ? image.title : '???'}
                        </p>
                      </div>
                      {isVisited && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-accent" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisitedGallery;