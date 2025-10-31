import React from 'react';
import { Modal, Button } from '@douyinfe/semi-ui';
import { artists } from '../data/artists';

interface ArtistListProps {
  onOpen: boolean;
  onClose: () => void;
}

const ArtistList: React.FC<ArtistListProps> = ({ onOpen, onClose }) => {
  return (
    <Modal
      title="图片画师"
      open={onOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>关闭</Button>
      ]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {artists.map((artist) => (
          <Button
            key={artist.id}
            type="tertiary"
            onClick={() => window.open(artist.url, '_blank')}
          >
            {artist.name}
          </Button>
        ))}
      </div>
      
      
    </Modal>
  );
};

export default ArtistList;