import {
    createDrawerNavigator,
    createAppContainer,
    createStackNavigator
} from 'react-navigation';
import HomePage from '../pages/HomePage';
import YourLists from '../pages/YourLists';
import CurrentList from '../pages/CurrentList';
import MapCreatorPage from '../pages/MapCreatorPage';
import SideMenu from './SideMenu';
import RegisterItemPage from '../pages/RegisterItemPage';
import CrowdSourcePage from '../pages/CrowdSourcePage';
import AddItemLocationPage from '../pages/AddItemLocationPage';
import YourContacts from '../pages/YourContacts';
import NewContact from '../pages/NewContact';
import ExcelParserPage from '../pages/ExcelParserPage';
import AddItemPage from '../pages/AddItemPage';
import SelectStorePage from '../pages/SelectStorePage';
import FindRecipePage from '../pages/FindRecipePage';
import MapsPage from '../pages/MapsPage';
import RecipeDetailsPage from '../pages/RecipeDetailsPage';
import FavRecipesPage from '../pages/FavRecipesPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import QuickCrowdSourcePage from '../pages/QuickCrowdSourcePage';
import UserAccountPage from '../pages/UserAccountPage';

const StackNavigator = createStackNavigator({
    Home: {
        screen: HomePage
    },
    AddItemLocationPage: {
        screen: AddItemLocationPage
    },
    MapCreatorPage: {
        screen: MapCreatorPage
    },
    YourListsPage: {
        screen: YourLists
    },
    CurrentListPage: {
        screen: CurrentList
    },
    CrowdSourcePage: {
        screen: CrowdSourcePage
    },
    RegisterItemPage: {
        screen: RegisterItemPage
    },
    YourContacts: {
        screen: YourContacts
    },
    NewContact: {
        screen: NewContact
    },
    ExcelParserPage: {
        screen: ExcelParserPage
    },
    AddItemPage: {
        screen: AddItemPage
    },
    SelectStorePage: {
        screen: SelectStorePage
    },
    FindRecipePage: {
        screen: FindRecipePage
    },
    MapsPage: {
        screen: MapsPage
    },
    RecipeDetailsPage: {
        screen: RecipeDetailsPage
    },
    FavRecipesPage: {
        screen: FavRecipesPage
    },
    PrivacyPolicyPage: {
        screen: PrivacyPolicyPage
    },
    QuickCrowdSourcePage: {
        screen: QuickCrowdSourcePage
    },
    UserAccountPage:{
        screen:UserAccountPage
    },
}, {
    initialRouteName: "Home",
    headerMode: "none"
});

const MainDrawerNavigator = createDrawerNavigator({
    Home: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: "Home"
        }
    },
    AddItemLocationPage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: "Add Item Location"
        }
    },
    MapCreatorPage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: "Map a Store"
        }
    },
    YourListsPage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: "Your Lists"
        }
    },
    CrowdSourcePage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: () => null
        }
    },
    RegisterItemPage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: "Register an Item"
        }
    },
    CurrentListPage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: () => null
        }
    },
    QuickCrowdSourcePage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: "Quick Crowd Source"
        }
    },
    YourContacts: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: "Contacts"
        }
    },
    NewContact: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: () => null
        }
    },
    ExcelParserPage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: "Excel Parser"
        }
    },
    FindRecipePage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: "Search for a Recipe"
        }
    },
    RecipeDetailsPage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: () => null
        }
    },
    FavRecipesPage: {
        screen: StackNavigator,
        navigationOptions: {
            drawerLabel: "Your Favourite Recipes"
        }
    },
    PrivacyPolicyPage: {
        screen: PrivacyPolicyPage,
        navigationOptions: {
            drawerLabel: "Privacy Policy"
        }
    },
    UserAccountPage:{
        screen: UserAccountPage,
        navigationOptions: {
            drawerLabel: "User Account"
        }
    },
}, {
    gesturesEnabled: false,
    contentComponent: SideMenu,
    drawerWidth: 250
});

const App = createAppContainer(MainDrawerNavigator);

export default App;