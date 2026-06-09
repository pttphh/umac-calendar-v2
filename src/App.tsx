import { BottomNav } from './components/layout/BottomNav';
import { CalendarView } from './components/calendar/CalendarView';
import { FeedView } from './components/feed/FeedView';
import { MeetingView } from './components/meeting/MeetingView';
import { MoreView } from './components/more/MoreView';
import { SearchResultsOverlay } from './components/search/SearchResultsOverlay';
import { EventForm } from './components/event/EventForm';
import { EventDetail } from './components/event/EventDetail';
import { MeetingForm } from './components/meeting/MeetingForm';
import { CalendarForm } from './components/calendar-mgmt/CalendarForm';
import { CalendarMgmtView } from './components/calendar-mgmt/CalendarMgmtView';
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
      </main>

      <SearchResultsOverlay />
      <BottomNav />
      <CalendarMgmtView />
      <EventForm />
      <EventDetail />
      <MeetingForm />
      <CalendarForm />
    </div>
  );
}

export default App;
