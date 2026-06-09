import { BottomNav } from './components/layout/BottomNav';
import { CalendarView } from './components/calendar/CalendarView';
import { FeedView } from './components/feed/FeedView';
import { MeetingView } from './components/meeting/MeetingView';
import { MoreView } from './components/more/MoreView';
import { SearchView } from './components/search/SearchView';
import { EventForm } from './components/event/EventForm';
import { EventDetail } from './components/event/EventDetail';
import { MeetingForm } from './components/meeting/MeetingForm';
import { CalendarForm } from './components/calendar-mgmt/CalendarForm';
import { useAppStore } from './store/useAppStore';

function App() {
  const currentTab = useAppStore((s) => s.currentTab);

  return (
    <div className="min-h-dvh bg-white">
      <main>
        {currentTab === 'calendar' && <CalendarView />}
        {currentTab === 'feed' && <FeedView />}
        {currentTab === 'meeting' && <MeetingView />}
        {currentTab === 'more' && <MoreView />}
        {currentTab === 'search' && <SearchView />}
      </main>

      <BottomNav />
      <EventForm />
      <EventDetail />
      <MeetingForm />
      <CalendarForm />
    </div>
  );
}

export default App;
