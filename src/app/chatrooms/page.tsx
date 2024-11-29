import AuthenticatedLayout from '../components/AuthenticatedLayout';
import ChatRoomList from '../components/ChatRoomList';
import SuggestedChatRooms from '../components/SuggestedChatRooms';

export default function ChatRoomsPage() {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Chat Rooms</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">All Chat Rooms</h2>
            <ChatRoomList />
          </div>
          <div>
            <SuggestedChatRooms />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

