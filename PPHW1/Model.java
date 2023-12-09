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
		Thing new_thing = new Thing(x, y, kind);
		things.add(new_thing);
	}

	public void removeThing(int index)
	{
		things.remove(things.get(index));
	}
}