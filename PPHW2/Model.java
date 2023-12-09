// import java.io.BufferedWriter;
// import java.io.FileWriter;
import java.awt.Point;
import java.util.ArrayList;

class Thing
{
	public int x;
	public int y;
	public int kind;

	Thing(int x, int y, int kind)
	{
		this.x = x;
		this.y = y;
		this.kind = kind;
	}

	public Point getPosition()
	{

		return new Point(this.x, this.y);
	}

}

class Model
{
	int curr_x;
	int curr_y;
	int dest_x;
	int dest_y;
	static int speed = 4;
	ArrayList<Thing> things;
	Thing rv_thing;
	Model model;

	static int curr_thing;

	Model()
	{
		this.curr_x = 100;
		this.curr_y = 200;
		this.dest_x = 100;
		this.dest_y = 200;

		this.things = new ArrayList<Thing>();
	}

    public void reset()
    {
        curr_x = 200;
        curr_y = 200;
        dest_x = curr_x;
        dest_y = curr_y;
    }

	public void setDestination(int x, int y)
	{
		this.dest_x = x;
		this.dest_y = y;
	}

	public void addThing(int x, int y, int kind)
	{
		if (kind == 11)
		{
			Jumper wee = new Jumper(x,y,kind);
			things.add(wee);
		}
		else
		{
			Thing new_thing = new Thing(x, y, kind);
			things.add(new_thing);
		}
	}

	public void removeThing(int index)
	{
		if(things.isEmpty()) {

		}
		else {
			things.remove(things.get(index));

		}
	}

	public Json marshal()
    {
        Json map = Json.newObject();
        Json thingsList = Json.newList();
		map.add("things", thingsList);

        for (Thing t : things)
        {
            //list_of_things.add(t.marshal());
			Json Jthing = Json.newObject();
			Jthing.add("x", t.x);
			Jthing.add("y", t.y);
			Jthing.add("kind", t.kind);
			thingsList.add(Jthing);
        }

        return map;
    }

	public void unmarshal(Json saveMap) 
	{
		Json thingsList = saveMap.get("things");
		if (thingsList != null)
		{
			this.things.clear();
			for (int i = 0; i < thingsList.size(); i++)
			{
				Json Jthing = thingsList.get(i);
				int x = (int) Jthing.getLong("x");
				int y = (int) Jthing.getLong("y");
				int kind = (int) Jthing.getLong("kind");
				this.addThing(x,y,kind);
			}
		}
	}

	public void save(String filename)
	{
		try
		{
			Json saveMap = marshal();
			saveMap.save(filename);
		}
		catch(Exception e)
		{
			throw new RuntimeException(e);
		}
	}

	public void load(String filename)
	{
		Json saveMap = Json.load(filename);
        unmarshal(saveMap);
	}

}

class Jumper extends Thing {

	Jumper(int x, int y, int kind) 
	{
		super(x, y, kind);
	}

	public Point getPosition()
	{
		return new Point(this.x, this.y - (int)Math.max(0., 50 * Math.sin(((double)View.count) / 5)));
	}
}